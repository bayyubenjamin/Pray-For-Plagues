import { nhostAdminRequest } from "./nhost-server";

const UPSERT = `
  mutation UpsertProfile($x_handle: String!, $wallet: String, $email: String, $points: Int!) {
    insert_profiles_one(
      object: { x_handle: $x_handle, wallet: $wallet, email: $email, points: $points }
      on_conflict: {
        constraint: profiles_x_handle_key
        update_columns: [wallet, email, points, updated_at]
      }
    ) {
      id x_handle wallet email points
    }
  }
`;

export async function upsertProfile(row: {
  xHandle: string;
  wallet?: string;
  email?: string;
  points?: number;
}) {
  try {
    await nhostAdminRequest(UPSERT, {
      x_handle: row.xHandle.replace(/^@/, "").toLowerCase(),
      wallet: row.wallet || null,
      email: row.email || null,
      points: row.points ?? 0,
    });
  } catch {
    // profiles table may be untracked; waitlist row is still source of truth
  }
}
