import ProductsPage from "@/components/dashboard/pages/Productspage ";

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
