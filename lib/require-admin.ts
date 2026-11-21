import { NextResponse } from "next/server";
import { isAdminRequest } from "./auth";

export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  if (await isAdminRequest(request)) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
