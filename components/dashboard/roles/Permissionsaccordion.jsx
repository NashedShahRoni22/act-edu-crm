"use client";

import { CheckSquare, Square, MinusSquare } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const formatPermissionName = (name) =>
  name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function PermissionsAccordion({
  groupedPermissions,
  selectedPermissions,
  onChange,
}) {
  const togglePermission = (permissionName) => {
    const next = selectedPermissions.includes(permissionName)
      ? selectedPermissions.filter((p) => p !== permissionName)
      : [...selectedPermissions, permissionName];
    onChange(next);
  };

  const toggleGroup = (groupName) => {
    const groupNames = (groupedPermissions[groupName] || []).map((p) => p.name);
    const allSelected = groupNames.every((n) => selectedPermissions.includes(n));
    const next = allSelected
      ? selectedPermissions.filter((p) => !groupNames.includes(p))
      : [...new Set([...selectedPermissions, ...groupNames])];
    onChange(next);
  };

  const groupState = (groupName) => {
    const groupNames = (groupedPermissions[groupName] || []).map((p) => p.name);
    const count = groupNames.filter((n) => selectedPermissions.includes(n)).length;
    if (count === 0) return "none";
    if (count === groupNames.length) return "all";
    return "partial";
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Accordion type="multiple" className="w-full">
        {Object.keys(groupedPermissions).map((groupName) => {
          const state = groupState(groupName);

          return (
            <AccordionItem key={groupName} value={groupName}>
              <AccordionTrigger className="px-4 hover:bg-gray-50 text-sm">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(groupName);
                    }}
                    className="flex items-center justify-center w-5 h-5"
                  >
                    {state === "all" ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : state === "partial" ? (
                      <MinusSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <span className="font-medium text-gray-900">{groupName}</span>
                  <span className="text-xs text-gray-500">
                    ({groupedPermissions[groupName].length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="space-y-2 pt-2">
                  {groupedPermissions[groupName].map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.name)}
                        onChange={() => togglePermission(permission.name)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary/50"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPermissionName(permission.name)}
                        </p>
                        <p className="text-xs text-gray-500">{permission.name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}