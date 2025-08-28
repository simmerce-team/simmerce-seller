import BusinessProfileSection from "@/components/profile/business-profile-section";
import ContactDetailsSection from "@/components/profile/contact-details-section";
import {
  BusinessCardSkeleton,
  ContactCardSkeleton,
} from "@/components/profile/skeletons";
import { Suspense } from "react";

export default async function ProfilePage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<BusinessCardSkeleton />}>
        {/* Server section fetches and renders client card */}
        <BusinessProfileSection />
      </Suspense>

      <Suspense fallback={<ContactCardSkeleton />}>
        {/* Server section fetches and renders client card */}
        <ContactDetailsSection />
      </Suspense>
    </div>
  );
}
