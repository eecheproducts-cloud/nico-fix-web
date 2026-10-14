// assets/js/services-data.js
// 30 services Maria/Nico marked "Ofrecemos: si" in the Notion "Checklist de Servicios" database
// (pulled 2026-09-22), plus 6 added directly by Maria on 2026-10-03 (microcement, tap replacement,
// simple plumbing, pipe installation, IKEA kitchens, bike assembly), pergola assembly and bathtub removal, not in Notion yet.
// Keep that database (https://app.notion.com/p/866d0ff7f2cc4ba79803139d6a5f0024) in sync.
// Categories are the cards of the services section, in the order they are shown (CATEGORY_ORDER).
export const CATEGORY_ORDER = [
  'furniture', 'mounting', 'paint', 'tiling', 'flooring', 'doors_locks',
  'plumbing', 'electrical', 'bathroom_kitchen', 'outdoor', 'bikes',
];

export const servicesData = [
  { key: 'svc_microcement', category: 'tiling' },
  { key: 'svc_tap_replacement', category: 'plumbing' },
  { key: 'svc_simple_plumbing', category: 'plumbing' },
  { key: 'svc_pipe_install', category: 'plumbing' },
  { key: 'svc_ikea_kitchen', category: 'furniture' },
  { key: 'svc_bike_assembly', category: 'bikes' },
  { key: 'svc_pergola', category: 'outdoor' },
  { key: 'svc_bathtub_removal', category: 'bathroom_kitchen' },
  { key: 'svc_crack_repair', category: 'paint' },
  { key: 'svc_seasonal_maintenance', category: 'outdoor' },
  { key: 'svc_door_adjustment', category: 'doors_locks' },
  { key: 'svc_carpet_removal', category: 'flooring' },
  { key: 'svc_ceramic_tiling', category: 'tiling' },
  { key: 'svc_faucet_repair', category: 'plumbing' },
  { key: 'svc_hanging', category: 'mounting' },
  { key: 'svc_exterior_painting', category: 'paint' },
  { key: 'svc_frame_painting', category: 'paint' },
  { key: 'svc_skirting', category: 'flooring' },
  { key: 'svc_closet_assembly', category: 'furniture' },
  { key: 'svc_smart_outlets', category: 'electrical' },
  { key: 'svc_smart_locks', category: 'doors_locks' },
  { key: 'svc_bathroom_renovation', category: 'bathroom_kitchen' },
  { key: 'svc_extractor_install', category: 'bathroom_kitchen' },
  { key: 'svc_kitchen_furniture', category: 'furniture' },
  { key: 'svc_furniture_assembly', category: 'furniture' },
  { key: 'svc_lock_change', category: 'doors_locks' },
  { key: 'svc_garden_maintenance', category: 'outdoor' },
  { key: 'svc_security_locks', category: 'doors_locks' },
  { key: 'svc_doorbell_intercom', category: 'electrical' },
  { key: 'svc_sealant_joints', category: 'tiling' },
  { key: 'svc_lighting_install', category: 'electrical' },
  { key: 'svc_tv_mount', category: 'mounting' },
  { key: 'svc_interior_painting', category: 'paint' },
  { key: 'svc_laminate_flooring', category: 'flooring' },
  { key: 'svc_security_cameras', category: 'electrical' },
  { key: 'svc_toilet_install', category: 'plumbing' },
  { key: 'svc_drain_clearing', category: 'plumbing' },
  { key: 'svc_shelving', category: 'mounting' },
];

export function groupByCategory(services) {
  return services.reduce((grouped, item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
    return grouped;
  }, {});
}
