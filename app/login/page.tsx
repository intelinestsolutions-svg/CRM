import { LoginForm } from "@/components/login-form";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  path: "/login",
  title: "Admin sign in — Studio Pro WhatsApp",
  description: "Sign in to the Studio Pro WhatsApp CRM dashboard.",
});

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <LoginForm defaultEmail={process.env.ADMIN_EMAIL ?? ""} />
    </div>
  );
}
