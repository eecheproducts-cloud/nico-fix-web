// assets/js/services-data.js
// FINAL list, 30 services Maria/Nico marked "Ofrecemos: si" in the Notion
// "Checklist de Servicios" database, pulled 2026-09-22. Do not edit without
// updating that Notion database first (https://app.notion.com/p/866d0ff7f2cc4ba79803139d6a5f0024).
export const servicesData = [
  { key: 'svc_crack_repair', category: 'paint' },
  { key: 'svc_seasonal_maintenance', category: 'maintenance' },
  { key: 'svc_door_adjustment', category: 'maintenance' },
  { key: 'svc_carpet_removal', category: 'flooring' },
  { key: 'svc_ceramic_tiling', category: 'flooring' },
  { key: 'svc_faucet_repair', category: 'plumbing' },
  { key: 'svc_hanging', category: 'assembly' },
  { key: 'svc_exterior_painting', category: 'paint' },
  { key: 'svc_frame_painting', category: 'paint' },
  { key: 'svc_skirting', category: 'flooring' },
  { key: 'svc_closet_assembly', category: 'assembly' },
  { key: 'svc_smart_outlets', category: 'smart_home' },
  { key: 'svc_smart_locks', category: 'smart_home' },
  { key: 'svc_bathroom_renovation', category: 'bathroom_kitchen' },
  { key: 'svc_extractor_install', category: 'bathroom_kitchen' },
  { key: 'svc_kitchen_furniture', category: 'bathroom_kitchen' },
  { key: 'svc_furniture_assembly', category: 'assembly' },
  { key: 'svc_lock_change', category: 'security' },
  { key: 'svc_garden_maintenance', category: 'outdoor' },
  { key: 'svc_security_locks', category: 'security' },
  { key: 'svc_doorbell_intercom', category: 'electrical' },
  { key: 'svc_sealant_joints', category: 'plumbing' },
  { key: 'svc_lighting_install', category: 'electrical' },
  { key: 'svc_tv_mount', category: 'assembly' },
  { key: 'svc_interior_painting', category: 'paint' },
  { key: 'svc_laminate_flooring', category: 'flooring' },
  { key: 'svc_security_cameras', category: 'security' },
  { key: 'svc_toilet_install', category: 'plumbing' },
  { key: 'svc_drain_clearing', category: 'plumbing' },
  { key: 'svc_shelving', category: 'assembly' },
];

export function groupByCategory(services) {
  return services.reduce((grouped, item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
    return grouped;
  }, {});
}
