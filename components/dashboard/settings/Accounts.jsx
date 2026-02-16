import BusinessInformation from "./account/Businessinformation";
import ManualPayment from "./account/ManualPayment";
import TaxSettings from "./account/Taxsettings";

export default function Accounts() {
  return (
    <div className="space-y-6">
      <BusinessInformation/>
      <ManualPayment/>
      <TaxSettings/>
    </div>
  )
}
