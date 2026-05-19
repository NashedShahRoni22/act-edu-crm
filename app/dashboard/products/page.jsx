import ProductsPage from "@/components/dashboard/pages/ProductsPage";

export const metadata = {
  title: "Products | ACT Education CRM",
  description: "Manage education products and courses offered by your partners and institutions.",
};

export default function page() {
  return (
    <div>
      <ProductsPage />
    </div>
  );
}
