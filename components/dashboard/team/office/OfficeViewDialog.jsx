"use client";

import { Building2, MapPin, Mail, Phone, Smartphone, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function OfficeViewDialog({
  open,
  onOpenChange,
  office,
  onEdit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {office?.name}
          </DialogTitle>
          <DialogDescription>Office details and contact information</DialogDescription>
        </DialogHeader>

        {office && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Address
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                {office.street && <p>{office.street}</p>}
                <p>
                  {office.city}, {office.state} {office.zip_code}
                </p>
                <p className="font-medium">{office.country}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{office.email}</span>
                </div>
                {office.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{office.phone}</span>
                  </div>
                )}
                {office.mobile && (
                  <div className="flex items-center gap-3 text-sm">
                    <Smartphone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Mobile:</span>
                    <span className="font-medium text-gray-900">{office.mobile}</span>
                  </div>
                )}
                {office.contact_person && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Contact Person:</span>
                    <span className="font-medium text-gray-900">{office.contact_person}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors"
          >
            Edit Office
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
