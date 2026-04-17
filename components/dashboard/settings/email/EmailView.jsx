import {
  Mail,
  User,
  Users as UsersIcon,
  FileSignature,
  Power,
  Inbox,
  Edit2,
} from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSharedUserNames } from "./helpers";

export default function EmailView({ email, users, onEdit, onClose }) {
  const isActive = email.status === "Active";
  const sharedNames = getSharedUserNames(email, users);

  return (
    <div className="py-2 space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </p>
          <p className="text-sm font-semibold text-gray-900 break-all">{email.email_id}</p>
        </div>

        {email.config?.display_name && (
          <div>
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5" /> Display Name
            </p>
            <p className="text-sm font-semibold text-gray-900">{email.config.display_name}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
            <Power className="w-3.5 h-3.5" /> Status
          </p>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            {email.status}
          </span>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
            <Inbox className="w-3.5 h-3.5" /> Incoming Type
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {email.config?.incoming_type === "associated_only" ? "Associated Only" : "All"}
          </p>
        </div>

        {email.system_email && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5" /> System Email
            </p>
            <p className="text-xs text-gray-600 break-all font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              {email.system_email}
            </p>
          </div>
        )}
      </div>

      {email.signature_content && (
        <div>
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-2">
            <FileSignature className="w-3.5 h-3.5" /> Email Signature
          </p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{email.signature_content}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-2">
          <UsersIcon className="w-3.5 h-3.5" /> Shared Users
        </p>
        {sharedNames.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sharedNames.map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
              >
                <User className="w-3 h-3" /> {name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No shared users</p>
        )}
      </div>

      <DialogFooter className="pt-2 border-t border-gray-100">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit} className="bg-primary hover:bg-primary-deep text-white">
          <Edit2 className="w-4 h-4 mr-2" /> Edit Email
        </Button>
      </DialogFooter>
    </div>
  );
}
