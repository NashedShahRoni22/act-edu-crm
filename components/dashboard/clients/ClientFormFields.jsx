"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  ChevronDown,
  MapPin,
  Building,
  Map,
  Hash,
  Globe,
  Calendar,
  GraduationCap,
  X,
  Check,
  Users,
  Share2,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { COUNTRY_OPTIONS } from "@/context/context";
import { SOURCES, GENDER_OPTIONS } from "@/constants";

export default function ClientFormFields({
  formData,
  setFormData,
  users,
  tags,
  degreeLevels,
  toggleTag,
  toggleDegreeLevel,
  tagsOpen,
  setTagsOpen,
}) {
  return (
    <>
      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#3B4CB8]" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, first_name: e.target.value }))
                }
                placeholder="John"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, last_name: e.target.value }))
                }
                placeholder="Doe"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, dob: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, gender: e.target.value }))
                }
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                required
              >
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#3B4CB8]" />
          Contact Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.secondary_email}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    secondary_email: e.target.value,
                  }))
                }
                placeholder="secondary@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+1234567890"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                required
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Address Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#3B4CB8]" />
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.street}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, street: e.target.value }))
                }
                placeholder="Allen Road"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="Sydney"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <div className="relative">
              <Map className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, state: e.target.value }))
                }
                placeholder="Sydney"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, postal_code: e.target.value }))
                }
                placeholder="2005"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={formData.country}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, country: e.target.value }))
                }
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
              >
                <option value="">Select Country</option>
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lead Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#3B4CB8]" />
          Lead Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignee <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={formData.assignee_id}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, assignee_id: e.target.value }))
                }
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                required
              >
                <option value="">Select Assignee</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Share2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, source: e.target.value }))
                }
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
                required
              >
                <option value="">Select Source</option>
                {SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Intake
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.preferred_intake}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    preferred_intake: e.target.value,
                  }))
                }
                placeholder="e.g. July 2026"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8]"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree Levels
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full min-h-10.5 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-left flex flex-wrap gap-1.5 items-center bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] transition-all relative",
                    formData.degree_levels.length === 0 && "text-gray-400",
                  )}
                >
                  <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-[13px]" />
                  {formData.degree_levels.length === 0 ? (
                    <span className="flex-1">Select degree levels...</span>
                  ) : (
                    degreeLevels
                      .filter((degreeLevel) =>
                        formData.degree_levels.includes(Number(degreeLevel.id)),
                      )
                      .map((degreeLevel) => (
                        <Badge
                          key={degreeLevel.id}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1 text-xs"
                        >
                          {degreeLevel.name}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDegreeLevel(degreeLevel.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                toggleDegreeLevel(degreeLevel.id);
                              }
                            }}
                            className="ml-0.5 hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </span>
                        </Badge>
                      ))
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-auto shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-56 overflow-y-auto">
                  {degreeLevels.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No degree levels found
                    </p>
                  ) : (
                    degreeLevels.map((degreeLevel) => {
                      const isSelected = formData.degree_levels.includes(
                        Number(degreeLevel.id),
                      );
                      return (
                        <button
                          key={degreeLevel.id}
                          type="button"
                          onClick={() => toggleDegreeLevel(degreeLevel.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left",
                            isSelected && "bg-[#3B4CB8]/5",
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "bg-[#3B4CB8] border-[#3B4CB8]"
                                : "border-gray-300",
                            )}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {degreeLevel.name}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full min-h-10.5 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-left flex flex-wrap gap-1.5 items-center bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4CB8]/50 focus:border-[#3B4CB8] transition-all relative",
                    formData.tag_ids.length === 0 && "text-gray-400",
                  )}
                >
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-[13px]" />
                  {formData.tag_ids.length === 0 ? (
                    <span className="flex-1">Select tags...</span>
                  ) : (
                    tags
                      .filter((tag) =>
                        formData.tag_ids.includes(Number(tag.id)),
                      )
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1 text-xs"
                        >
                          {tag.name}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTag(tag.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                toggleTag(tag.id);
                              }
                            }}
                            className="ml-0.5 hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </span>
                        </Badge>
                      ))
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-auto shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div
                  className="max-h-56 overflow-y-auto overscroll-contain"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {tags.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No tags found
                    </p>
                  ) : (
                    tags.map((tag) => {
                      const isSelected = formData.tag_ids.includes(
                        Number(tag.id),
                      );
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left",
                            isSelected && "bg-[#3B4CB8]/5",
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "bg-[#3B4CB8] border-[#3B4CB8]"
                                : "border-gray-300",
                            )}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {tag.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              Used {tag.usage_count ?? 0} times
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {formData.tag_ids.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {formData.tag_ids.length} tag
                {formData.tag_ids.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
