import { getProfileData } from "@/actions/profile";
import { ContactDetailsCard, type ContactValues } from "./contact-details-card";

export default async function ContactDetailsSection() {
  const data = await getProfileData();
  const business = data?.business || {};

  const initialValues: ContactValues = {
    fullName: data?.user?.full_name || "",
    email: data?.user?.email || "",
    phone: data?.user?.phone || "",
    address: business.address || "",
    city: business.city?.id ? String(business.city.name) : "",
    state: business.state?.id ? String(business.state.name) : "",
    pincode: business.pincode || "",
  };

  return <ContactDetailsCard initialValues={initialValues} />;
}
