import { NextResponse } from "next/server";
import { createServiceRoleClient, createClient } from "@/lib/supabase/server";

// route to delete a supabase user
export async function DELETE() {
  try {
    // Create a normal client to get the current session
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to delete your account." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Create a service role client to delete the user securely
    const serviceClient = createServiceRoleClient();

    // Delete user from Supabase Auth
    const { error: authError } = await serviceClient.auth.admin.deleteUser(
      userId
    );

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: unknown) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
