import { BusinessType, getBusinessTypes } from "@/actions/business-types";
import { getProfileData } from "@/actions/profile";
import { BusinessProfileCard, type BusinessValues } from "./business-profile-card";

export default async function BusinessProfileSection() {
  const [types, data] = await Promise.all([getBusinessTypes(), getProfileData()]);

  const businessTypes: BusinessType[] = (types || []).map((t: any) => ({ id: String(t.id), name: t.name }));
  const business = data?.business || {};

  const initialValues: BusinessValues = {
    businessName: business.name || "",
    businessType: business.business_type_id ? String(business.business_type_id) : "",
    gstNumber: business.gst_number || "",
  };

  return <BusinessProfileCard initialValues={initialValues} businessTypes={businessTypes} />;
}
