import type { Metadata } from "next";
import { AccountDesk } from "@/components/members/AccountDesk";

export const metadata: Metadata = {
  title: "House List — sign in / sign up",
  description:
    "Join the ZENJI house list. Concept member accounts: salted + hashed passcodes, per-member cred, loadout, closet slots and counter slips, all stored in your browser.",
};

export default function AccountPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <header className="border-b border-bone/10 pb-8">
        <p className="label">Update_006 // {`{ MEMBERS : HOUSE LIST }`}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">The house list</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
          One handle, one card, your whole wardrobe. Sign up and everything you have earned so far comes with you;
          sign in and it is back exactly how you left it.
        </p>
      </header>
      <div className="mt-8">
        <AccountDesk />
      </div>
    </div>
  );
}
