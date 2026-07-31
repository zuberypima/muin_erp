export interface ContainerItem {
  id: string | number;
  container_number: string; // e.g. MSKU-789123-4
  size_type: '20ft GP' | '40ft HC' | '40ft Reefer' | '45ft High Cube' | '20ft Open Top';
  cargo_description: string;
  shipping_line: string; // e.g. Maersk, MSC, CMA CGM, PIL, Ocean Network Express
  seal_number: string;
  gross_weight_kg: number;
  terminal_yard: string; // e.g. Dar es Salaam Port Yard A, Kwala Dry Port, TAZARA ICD
  yard_slot: string; // e.g. Block C4-B3-L2
  status: 'in-yard' | 'on-vessel' | 'dispatched' | 'customs-hold';
  flow_type?: 'import' | 'export';
  shipper?: string;
  consignee: string;
  origin_port?: string;
  destination_port?: string;
  customs_cleared: boolean;
  bill_of_lading: string;
  gate_in_date?: string;
}

export interface VesselVoyage {
  id: string | number;
  vessel_name: string; // e.g. MV Muin Trader
  imo_number: string; // e.g. IMO 9812401
  voyage_number: string; // e.g. V.2026-04E
  origin_port: string; // e.g. Port of Singapore, Port of Shanghai, Dubai Jebel Ali
  destination_port: string; // e.g. Port of Dar es Salaam, Port of Zanzibar, Mombasa
  eta: string;
  etd: string;
  berth_no: string;
  total_teus: number;
  status: 'at-anchor' | 'berthing-loading' | 'sailing' | 'arrived' | 'completed';
  shipping_line: string;
}

export interface ContainerDispatch {
  id: string | number;
  bill_of_lading: string; // e.g. BL-TZ-2026-9901
  container_number: string;
  shipper: string;
  consignee: string;
  destination_city: string; // e.g. Lusaka (Zambia), Kigali (Rwanda), Bujumbura, Dodoma
  transport_mode: 'Road Transport (Truck)' | 'Rail Freight (TAZARA)' | 'Feeder Vessel';
  truck_plate_or_train: string;
  driver_name: string;
  status: 'gate-pass-issued' | 'in-transit' | 'delivered-at-border' | 'delivered-consignee' | 'delayed';
  dispatch_date: string;
  customs_release_ref: string;
}

export interface MarineAsset {
  id: string | number;
  asset_tag: string;
  name: string;
  asset_type: 'Tugboat' | 'Barge' | 'Quay Crane (STS)' | 'RTG Crane' | 'Reach Stacker' | 'Haulage Truck';
  registration_number: string;
  terminal_base: string;
  operator_name: string;
  status: 'operational' | 'under-maintenance' | 'dry-docking' | 'decommissioned';
  capacity: string; // e.g. 60-Ton Bollard Pull, 45-Ton Reach Stacker
  last_inspection: string;
}

export const SHIPPING_LINES = [
  'Maersk Line',
  'MSC (Mediterranean Shipping Co)',
  'CMA CGM',
  'COSCO Shipping',
  'Hapag-Lloyd',
  'Ocean Network Express (ONE)',
  'PIL (Pacific International Lines)',
  'Evergreen Line',
  'HMM Co., Ltd.',
  'Yang Ming Marine Transport'
];

export const TERMINAL_YARDS = [
  'Dar es Salaam Port Container Terminal (TICTS)',
  'Bandari Container Yard Block A',
  'Bandari Container Yard Block B',
  'TAZARA Inland Container Depot (ICD)',
  'Kwala Dry Port Terminal (Ruvu)',
  'Zanzibar Malindi Port Yard'
];

export const MAJOR_PORTS = [
  'Port of Dar es Salaam (Tanzania)',
  'Port of Zanzibar (Tanzania)',
  'Port of Tanga (Tanzania)',
  'Port of Mombasa (Kenya)',
  'Port of Shanghai (China)',
  'Port of Singapore',
  'Port of Jebel Ali (Dubai, UAE)',
  'Port of Durban (South Africa)'
];
