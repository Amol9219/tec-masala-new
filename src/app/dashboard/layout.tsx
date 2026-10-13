"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ownerOnly = [
  "/dashboard/outlets",
  "/dashboard/outlet-logins",
  "/dashboard/coowner-login",
  "/dashboard/settings",
  "/users",
];

const allowedForNonOwners = [
  "/dashboard",
  "/dashboard/products",
  "/dashboard/stock",
  "/dashboard/prices",
  "/dashboard/orders",
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        window.location.replace("/login");
        return;
      }
      const { data: roleRow, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error || !roleRow?.role) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      const role = roleRow.role as string;
      const owner = role === "Owner";
      const ownerOnlyRoute = ownerOnly.some((path) => pathname === path || pathname.startsWith(path + "/"));
      const allowedRoute = pathname === "/dashboard" || allowedForNonOwners.slice(1).some((path) => pathname === path || pathname.startsWith(path + "/"));
      const staffRoute = pathname === "/dashboard" || ["/dashboard/products", "/dashboard/orders"].some((path) => pathname === path || pathname.startsWith(path + "/"));
      const canOpen = owner || (!ownerOnlyRoute && (
        (role === "Manager" && allowedRoute) ||
        (role === "Staff" && staffRoute)
      ));
      setAllowed(canOpen);
      setLoading(false);
      if (!canOpen) window.location.replace("/dashboard");
    }
    setLoading(true);
    void checkAccess();
    return () => { active = false; };
  }, [pathname]);

  if (loading || !allowed) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#080808", color: "#fff", fontFamily: "Arial,sans-serif" }}>
        <p>{loading ? "Access तपासत आहोत..." : "या पेजसाठी परवानगी नाही. Dashboard कडे जात आहोत..."}</p>
      </main>
    );
  }
  return <>{children}</>;
}
