"use client";

import Accounts from "./Accounts";
import CompanyEmails from "./companyemail/CompanyEmails";
import Preferences from "./Preferences";
import TagManagement from "./Tagmanagement";
import EmailTemplates from "./templates/EmailTemplates";
import Workflowpage from "./Workflowpage";

export default function SectionContainer({ activeNav }) {
  const renderContent = () => {
    switch (activeNav) {
      case "preferences":
        return <Preferences />;
      case "tag-management":
        return <TagManagement/>;
      // case "subscription-billing":
      //   return <DefaultPlaceholder section="Subscription & Billing" />;
      case "accounts":
        return <Accounts />;
      case "workflows":
        return <Workflowpage/>;
      case "email":
        return <CompanyEmails/>;
      case "templates":
        return <EmailTemplates />;
      case "phone-settings":
        return <DefaultPlaceholder section="Phone Settings" />;
      case "lead-forms":
        return <DefaultPlaceholder section="Lead Forms" />;
      case "advanced-automation":
        return <DefaultPlaceholder section="Advanced Automation Settings" />;
      case "custom-fields":
        return <DefaultPlaceholder section="Custom Fields" />;
      case "general":
        return <DefaultPlaceholder section="General" />;
      case "data-import":
        return <DefaultPlaceholder section="Data Import" />;
      case "office-check-in":
        return <DefaultPlaceholder section="Office Check-In" />;
      case "api-integrations":
        return <DefaultPlaceholder section="API & Integrations" />;
      default:
        return <DefaultPlaceholder section="Unknown Section" />;
    }
  };

  return <div className="max-w-4xl">{renderContent()}</div>;
}

function DefaultPlaceholder({ section }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{section}</h3>
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>📋 Content for {section}</strong>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Add your component for this section in SectionContainer.jsx
        </p>
      </div>
    </div>
  );
}