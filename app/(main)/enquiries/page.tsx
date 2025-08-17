import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EnquiriesPage() {
  return (
    <Card className="grid grid-cols-1 md:grid-cols-7 gap-4 px-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Enquiries</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      <Card className="md:col-span-5">
        <CardHeader>User Name</CardHeader>
        <CardContent>

        </CardContent>
      </Card>
    </Card>
  );
}
