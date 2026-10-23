const ICON_CLASS_MAP = {
  account_circle: "fa-solid fa-circle-user",
  add: "fa-solid fa-plus",
  add_a_photo: "fa-solid fa-camera",
  add_box: "fa-solid fa-square-plus",
  add_circle: "fa-solid fa-circle-plus",
  admin_panel_settings: "fa-solid fa-user-shield",
  arrow_forward: "fa-solid fa-arrow-right",
  assignment_turned_in: "fa-solid fa-clipboard-check",
  badge: "fa-solid fa-id-badge",
  biotech: "fa-solid fa-dna",
  block: "fa-solid fa-ban",
  business: "fa-brands fa-linkedin-in",
  calendar_month: "fa-solid fa-calendar-days",
  calendar_today: "fa-solid fa-calendar-days",
  call: "fa-solid fa-phone",
  cancel: "fa-solid fa-circle-xmark",
  check: "fa-solid fa-check",
  check_circle: "fa-solid fa-circle-check",
  chevron_left: "fa-solid fa-chevron-left",
  chevron_right: "fa-solid fa-chevron-right",
  clinical_notes: "fa-solid fa-notes-medical",
  close: "fa-solid fa-xmark",
  contact_phone: "fa-solid fa-address-book",
  delete: "fa-solid fa-trash",
  delete_sweep: "fa-solid fa-trash-can",
  description: "fa-solid fa-file-lines",
  dashboard: "fa-solid fa-table-columns",
  dashboard_customize: "fa-solid fa-table-columns",
  download: "fa-solid fa-download",
  eco: "fa-solid fa-seedling",
  edit: "fa-solid fa-pen-to-square",
  edit_note: "fa-solid fa-file-pen",
  error: "fa-solid fa-circle-exclamation",
  event_available: "fa-solid fa-calendar-check",
  event_note: "fa-solid fa-calendar-days",
  event_repeat: "fa-solid fa-calendar-week",
  explore: "fa-solid fa-compass",
  filter_list: "fa-solid fa-filter",
  groups: "fa-solid fa-users",
  health_and_safety: "fa-solid fa-shield-heart",
  history_edu: "fa-solid fa-file-signature",
  hotel: "fa-solid fa-bed",
  lab_research: "fa-solid fa-flask-vial",
  lightbulb: "fa-solid fa-lightbulb",
  local_parking: "fa-solid fa-square-parking",
  location_on: "fa-solid fa-location-dot",
  lock: "fa-solid fa-lock",
  logout: "fa-solid fa-right-from-bracket",
  mail: "fa-solid fa-envelope",
  medical_information: "fa-solid fa-notes-medical",
  medical_services: "fa-solid fa-briefcase-medical",
  medication: "fa-solid fa-pills",
  menu: "fa-solid fa-bars",
  more_vert: "fa-solid fa-ellipsis-vertical",
  notifications: "fa-solid fa-bell",
  open_in_new: "fa-solid fa-up-right-from-square",
  payments: "fa-solid fa-money-bill-wave",
  pending_actions: "fa-solid fa-list-check",
  person: "fa-solid fa-user",
  photo_camera: "fa-brands fa-instagram",
  play_circle: "fa-solid fa-circle-play",
  public: "fa-brands fa-facebook-f",
  radiology: "fa-solid fa-x-ray",
  schedule: "fa-solid fa-clock",
  school: "fa-solid fa-graduation-cap",
  search: "fa-solid fa-magnifying-glass",
  settings: "fa-solid fa-gear",
  shield: "fa-solid fa-shield-halved",
  star: "fa-solid fa-star",
  stethoscope: "fa-solid fa-stethoscope",
  task_alt: "fa-solid fa-circle-check",
  verified: "fa-solid fa-circle-check",
  verified_user: "fa-solid fa-user-shield",
  visibility: "fa-solid fa-eye",
  visibility_off: "fa-solid fa-eye-slash",
  vital_signs: "fa-solid fa-wave-square",
  workspace_premium: "fa-solid fa-certificate"
};

const ICON_TWEAK_CLASS_MAP = {
  biotech: "fa-bridge-biotech",
  dashboard: "fa-bridge-dashboard",
  dashboard_customize: "fa-bridge-dashboard",
  groups: "fa-bridge-groups",
  medical_services: "fa-bridge-medical-services",
  menu: "fa-bridge-menu",
  radiology: "fa-bridge-radiology",
  school: "fa-bridge-school",
  vital_signs: "fa-bridge-vital-signs",
  workspace_premium: "fa-bridge-workspace-premium"
};

const ALL_FA_CLASSES = Array.from(
  new Set(
    Object.values(ICON_CLASS_MAP)
      .join(" ")
      .split(" ")
      .filter(Boolean)
  )
);

const ALL_TWEAK_CLASSES = Array.from(new Set(Object.values(ICON_TWEAK_CLASS_MAP)));

const isHTMLElement = (node) =>
  typeof HTMLElement !== "undefined" && node instanceof HTMLElement;

const resolveIconName = (iconElement) => {
  const rawIconName = (iconElement.textContent || "").trim().toLowerCase();
  if (rawIconName) {
    iconElement.dataset.faSource = rawIconName;
    return rawIconName;
  }

  return (iconElement.dataset.faSource || iconElement.dataset.faIcon || "").trim().toLowerCase();
};

const applyIcon = (iconElement) => {
  const iconName = resolveIconName(iconElement);
  if (!iconName) {
    return;
  }

  const hasFaClasses = ALL_FA_CLASSES.some((className) => iconElement.classList.contains(className));

  if (iconElement.dataset.faIcon === iconName && hasFaClasses && iconElement.classList.contains("fa-fw")) {
    return;
  }

  const classes = (ICON_CLASS_MAP[iconName] || "fa-solid fa-circle").split(" ");
  iconElement.classList.remove(...ALL_FA_CLASSES);
  iconElement.classList.remove(...ALL_TWEAK_CLASSES);
  iconElement.classList.add(...classes, "fa-fw");

  const tweakClass = ICON_TWEAK_CLASS_MAP[iconName];
  if (tweakClass) {
    iconElement.classList.add(tweakClass);
  }

  iconElement.dataset.faIcon = iconName;
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = "";
};

const scanAndApply = (root = document) => {
  root.querySelectorAll(".material-symbols-outlined").forEach(applyIcon);
};

export const initFontAwesomeBridge = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  scanAndApply(document);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") {
        const parent = mutation.target?.parentElement;
        if (parent?.classList?.contains("material-symbols-outlined")) {
          applyIcon(parent);
        }
        return;
      }

      if (mutation.type === "attributes" && isHTMLElement(mutation.target) && mutation.target.classList.contains("material-symbols-outlined")) {
        applyIcon(mutation.target);
        return;
      }

      if (mutation.type === "childList" && isHTMLElement(mutation.target) && mutation.target.classList.contains("material-symbols-outlined")) {
        applyIcon(mutation.target);
      }

      mutation.addedNodes.forEach((node) => {
        if (!isHTMLElement(node)) {
          if (node.nodeType === Node.TEXT_NODE && node.parentElement?.classList?.contains("material-symbols-outlined")) {
            applyIcon(node.parentElement);
          }
          return;
        }
        if (node.classList.contains("material-symbols-outlined")) {
          applyIcon(node);
          return;
        }
        scanAndApply(node);
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class"]
  });
};
