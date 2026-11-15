// Public (anon) reads for the ecosystem's transparency pages.
// Pages call these functions; they never touch Supabase themselves.
import { createPublicClient } from '@/lib/supabase/public';

/** One donation receipt, fetched by its secret Stripe session id. Null if not found. */
export async function getReceipt<T>(sessionId: string): Promise<T | null> {
  try {
    const supabase = createPublicClient();
    // get_receipt is a security-definer RPC: fetchable by the (secret) session id,
    // but zo_donations stays non-enumerable to anon.
    const { data } = await supabase.rpc('get_receipt', { p_session_id: sessionId });
    return (data?.[0] as T) ?? null;
  } catch {
    return null;
  }
}

/** Every gene module plus every product, for the genome page. */
export async function getGenomeData() {
  const supabase = createPublicClient();
  const [{ data: modules }, { data: products }] = await Promise.all([
    supabase.from('v_genome').select('module_id,name,description,module_type,project_origin,times_used,created_at'),
    supabase.from('v_products').select('name,status,url'),
  ]);
  return { modules: modules ?? [], products: products ?? [] };
}

/** One page of spend rows, the true total count, and the latest public donations. */
export async function getTreasuryLedger(page: number, product: string, pageSize: number) {
  const supabase = createPublicClient();

  let costsQuery = supabase
    .from('v_cost_logs')
    .select('created_at,workflow,project_id,cost_usd')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (product) costsQuery = costsQuery.eq('project_id', product);

  // THE COUNT MUST NOT DEPEND ON THE PAGE. A count on the ranged query returns
  // null once the range is past the end ("page 99 of 1"). So the count is its own
  // head-only query with no range: overshooting the last page still prints the
  // real total.
  let countQuery = supabase.from('v_cost_logs').select('created_at', { count: 'exact', head: true });
  if (product) countQuery = countQuery.eq('project_id', product);

  const [{ data: costs }, { count }, { data: donations }] = await Promise.all([
    costsQuery,
    countQuery,
    supabase
      .from('v_donations_public')
      .select('created_at,amount,donor_name,allocated_project_id')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);
  return { costs: costs ?? [], count, donations: donations ?? [] };
}
