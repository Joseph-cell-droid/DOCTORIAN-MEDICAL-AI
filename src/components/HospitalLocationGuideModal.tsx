import React from 'react';
import {
  X,
  Navigation,
  MapPin,
  Compass,
  Phone,
  Bed,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import {
  UgandaHospital,
  NearbyHospitalItem,
  UGANDA_REGIONAL_CENTERS
} from '../services/ugandaHospitalGpsService';
import { useAppLanguage } from '../utils/translations';

interface HospitalLocationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: UgandaHospital;
  distanceKm: number;
  estimatedArrivalMins: number;
  bearingDegrees: number;
  cardinal: string;
  directionText: string;
  googleMapsDirUrl?: string;
  isGpsLive: boolean;
  isScanningGps: boolean;
  gpsError: string | null;
  nearbyHospitals: NearbyHospitalItem[];
  onScanGps: () => void;
  onSelectDistrict: (districtKey: string) => void;
  onSelectHospitalById: (hospitalId: string) => void;
  liveBeds?: {
    total: number;
    occupied: number;
    available: number;
    cleaning: number;
    occupancyPct: number;
  };
}

export const HospitalLocationGuideModal: React.FC<HospitalLocationGuideModalProps> = ({
  isOpen,
  onClose,
  hospital,
  distanceKm,
  estimatedArrivalMins,
  bearingDegrees,
  cardinal,
  directionText,
  googleMapsDirUrl,
  isGpsLive,
  isScanningGps,
  gpsError,
  nearbyHospitals,
  onScanGps,
  onSelectDistrict,
  onSelectHospitalById,
  liveBeds
}) => {
  const [, , t] = useAppLanguage();
  if (!isOpen) return null;

  const quickDistricts = ['Kampala', 'Lira', 'Gulu', 'Mbarara', 'Arua', 'Mbale', 'Jinja', 'Soroti', 'Entebbe', 'Fort Portal', 'Masaka', 'Hoima'];

  return (
    <div className="fixed inset-0 z-[260] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl doctorian-thick-card bg-[#07142e] text-white overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/25 flex items-center justify-between gap-3 bg-[#051026]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
              <Compass size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {t('Hospital Locator, Photos & Direction Guide')}
              </h2>
              <p className="text-xs text-cyan-200/80">
                {t('Photo, distance & compass direction update automatically with your phone location')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Active Hospital Hero Card with Photo + Live Compass + Directions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 doctorian-thick-tile p-4">
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden min-h-[190px] border-2 border-cyan-400/40">
              <img
                src={hospital.photoUrl}
                alt={hospital.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03091a] via-transparent to-black/30" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/70 border border-cyan-400/50 text-[10px] font-black text-cyan-300 backdrop-blur-sm">
                  {isGpsLive ? '● GPS LIVE' : '● LOCATION SYNCED'}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                  {hospital.level} • {hospital.region}
                </span>
                <h3 className="text-base font-black text-white leading-tight">{hospital.name}</h3>
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-cyan-200 text-xs font-black flex items-center gap-1.5">
                    <MapPin size={13} className="text-cyan-400" />
                    {hospital.district}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                    {distanceKm} km away (~{estimatedArrivalMins} min)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-black flex items-center gap-1.5">
                    <Navigation
                      size={13}
                      className="text-amber-300"
                      style={{ transform: `rotate(${bearingDegrees}deg)` }}
                    />
                    {bearingDegrees}° {cardinal}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#040d22] border border-cyan-500/30 text-xs text-slate-200 leading-relaxed">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block mb-1">
                    {t('Direction From Phone Location')}
                  </span>
                  {directionText}
                </div>

                {liveBeds && (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[#051029] border border-blue-800/50">
                      <span className="text-[10px] text-slate-400 block">{t('Total Beds')}</span>
                      <span className="font-black text-white">{liveBeds.total}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#051029] border border-rose-500/40">
                      <span className="text-[10px] text-rose-300 block">{t('Occupied')}</span>
                      <span className="font-black text-rose-300">{liveBeds.occupied}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#051029] border border-emerald-500/40">
                      <span className="text-[10px] text-emerald-300 block">{t('Available Free')}</span>
                      <span className="font-black text-emerald-300">{liveBeds.available}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onScanGps}
                  disabled={isScanningGps}
                  className="doctorian-cta-btn px-4 py-2.5 rounded-full text-xs font-black text-white flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} className={isScanningGps ? 'animate-spin' : ''} />
                  <span>{isScanningGps ? t('Detecting Phone GPS...') : t('Use Phone Live GPS')}</span>
                </button>

                {googleMapsDirUrl && (
                  <a
                    href={googleMapsDirUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-300/40 text-white text-xs font-black flex items-center gap-1.5"
                  >
                    <Navigation size={14} />
                    <span>{t('Open Turn-by-Turn Route')}</span>
                    <ExternalLink size={12} />
                  </a>
                )}

                <a
                  href={`tel:${hospital.emergencyPhone}`}
                  className="px-4 py-2.5 rounded-full doctorian-dark-btn text-cyan-200 text-xs font-black flex items-center gap-1.5"
                >
                  <Phone size={14} />
                  <span>{hospital.emergencyPhone}</span>
                </a>
              </div>
              {gpsError && <p className="text-[11px] text-amber-300 font-semibold">{gpsError}</p>}
            </div>
          </div>

          {/* Switch Phone Location / City Selector (e.g. Lira, Gulu, Kampala, Mbarara) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                {t('Switch Phone City / District Location')}
              </span>
              <span className="text-[11px] text-slate-400">
                {t('Tap any location (e.g. Lira) to switch hospital photo & distance')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickDistricts.map((city) => {
                const isSelected = hospital.district.toLowerCase().includes(city.toLowerCase()) || hospital.shortName.toLowerCase().includes(city.toLowerCase());
                const label = UGANDA_REGIONAL_CENTERS[city]?.name ? city : city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => onSelectDistrict(city)}
                    className={`px-3.5 py-2 rounded-full text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'doctorian-cta-btn text-white border-cyan-300'
                        : 'bg-[#091839] hover:bg-[#102657] text-slate-200 border-cyan-500/25'
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={13} />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nearby Hospitals Ranked by Distance with Photos & Directions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-400" />
                {t('Nearby Hospitals From Current Phone Location')}
              </h4>
              <span className="text-[11px] text-slate-400">{t('Sorted closest first')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nearbyHospitals.slice(0, 6).map((item) => {
                const isCurrent = item.hospital.id === hospital.id;
                return (
                  <div
                    key={item.hospital.id}
                    onClick={() => onSelectHospitalById(item.hospital.id)}
                    className={`rounded-2xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col justify-between bg-[#081633] ${
                      isCurrent ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.3)]' : 'border-cyan-500/25 hover:border-cyan-400/60'
                    }`}
                  >
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={item.hospital.photoUrl}
                        alt={item.hospital.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#061026] via-transparent to-black/20" />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/75 border border-cyan-400/40 text-[10px] font-black text-cyan-300">
                        {item.distanceKm} km
                      </span>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-blue-600/80 text-[9px] font-black text-white flex items-center gap-1">
                        <Navigation size={10} style={{ transform: `rotate(${item.bearingDegrees}deg)` }} />
                        {item.cardinal} ({item.estimatedArrivalMins} min)
                      </span>
                    </div>

                    <div className="p-3 space-y-1">
                      <p className="text-xs font-black text-white truncate">{item.hospital.shortName}</p>
                      <p className="text-[10px] text-cyan-300 truncate">{item.hospital.district}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{item.hospital.addressHint}</p>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
                        <span className="text-slate-300 flex items-center gap-1">
                          <Bed size={11} className="text-emerald-400" />
                          {item.hospital.bedCapacity} capacity
                        </span>
                        <span className={isCurrent ? 'text-emerald-400' : 'text-cyan-400'}>
                          {isCurrent ? 'Selected' : 'Select →'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalLocationGuideModal;
