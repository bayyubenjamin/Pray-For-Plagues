import { nhostAdminRequest } from "./nhost-server";

const UPSERT = `
  mutation UpsertProfile(
    $x_handle: String!,
    $wallet: String,
    $email: String,
    $connected_wallet: String,
    $points: Int!
  ) {
    insert_profiles_one(
      object: {
        x_handle: $x_handle,
        wallet: $wallet,
        email: $email,
        connected_wallet: $connected_wallet,
        points: $points
      }
      on_conflict: {
        constraint: profiles_x_handle_key
        update_columns: [wallet, email, connected_wallet, points, updated_at]
      }
    ) {
      id x_handle wallet email connected_wallet points
    }
  }
`;

export async function upsertProfile(row: {
  xHandle: string;
  wallet?: string | null;
  email?: string | null;
  connectedWallet?: string | null;
  points?: number;
}) {
  await nhostAdminRequest(UPSERT, {
    x_handle: row.xHandle.replace(/^@/, "").toLowerCase(),
    wallet: row.wallet || null,
    email: row.email || null,
    connected_wallet: row.connectedWallet || null,
    points: row.points ?? 0,
  });
}
