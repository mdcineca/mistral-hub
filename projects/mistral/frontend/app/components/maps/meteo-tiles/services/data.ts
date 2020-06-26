export interface LegendConfig {
    id: string;
    title: string;
    legend_type: string;
    colors: string[];
    labels: string[];
}

export const LEGEND_DATA: LegendConfig[] = [
    {
        "id": "tm2",
        "legend_type": "legend_t2m",
        "title": "T [°C]",
        "colors": ["#ffcc00", "#ff9900", "#ff6600", "#ff0000", "#cc0000", "#990000", "#660000", "#660066", "#990099", "#cc00cc", "#ff00ff", "#bf00ff", "#7200ff",
            "#0000ff", "#0059ff", "#008cff", "#00bfff", "#00ffff", "#00e5cc", "#00cc7f", "#00b200", "#7fcc00", "#cce500", "#ffff00", "#ffcc00", "#ff9900",
            "#ff6600", "#ff0000", "#cc0000", "#990000", "#660000", "#660066", "#990099", "#cc00cc", "#ff00ff", "#bf00ff", "#7200ff", "#ffcc00", "#ff9900"],
        "labels": ["-30", " ", "-26", " ", "-22", "", "-18", " ", "-14", " ",
            "-10", " ", "-6", " ", "-2", " ", "2", " ", "6", " ", "10", " ", "14", " ", "18",
            "", "22", " ", "26", " ", "30", " ", "34", " ", "38", " ", "42", " ", "46"]
    },
    {
        "id": "prec3tp",
        "legend_type": "legend_prec",
        "title": "Prp [mm]",
        "colors": ["rgba(0,204,255,0.2)", "rgba(0,255,255,0.25)", "rgba(48, 196, 135, 0.30)", "rgba(128, 255, 0, 0.35)",
            "rgba(225, 227, 22, 0.40)", "rgba(255,255,128, 0.45)", "rgba(255,255,0, 0.5)", "rgba(255,200,0, 0.55)",
            "rgba(255,185,67, 0.6)", "rgba(255,115,0, 0.65)", "rgba(255,0,0, 0.65)", "rgba(204,0,0, 0.7)",
            "rgba(223,83,121, 0.75)", "rgba(242,166,242,0.8)", "rgba(217,140,217,0.85)", "rgba(191,128,217,0.9)",
            "rgba(153,153,255,0.95)", "rgba(0,153,255,1)"],
        "labels": ["1", "2", "3", "4", "5", "6", "8", "10", "15", "20", "25", "30", "40", "50", "75", "100", "200", "300"]
    },
    {
        "id": "prec6tp",
        "legend_type": "legend_prec",
        "title": "Prp [mm]",
        "colors": ["rgba(0,204,255,0.2)", "rgba(0,255,255,0.25)", "rgba(48, 196, 135, 0.30)", "rgba(128, 255, 0, 0.35)",
            "rgba(225, 227, 22, 0.40)", "rgba(255,255,128, 0.45)", "rgba(255,255,0, 0.5)", "rgba(255,200,0, 0.55)",
            "rgba(255,185,67, 0.6)", "rgba(255,115,0, 0.65)", "rgba(255,0,0, 0.65)", "rgba(204,0,0, 0.7)",
            "rgba(223,83,121, 0.75)", "rgba(242,166,242,0.8)", "rgba(217,140,217,0.85)", "rgba(191,128,217,0.9)",
            "rgba(153,153,255,0.95)", "rgba(0,153,255,1)"],
            "labels": ["1", "2", "3", "4", "5", "6", "8", "10", "15", "20", "25", "30", "40", "50", "75", "100", "200", "300"]

    },
    {
        "id": "sf3",
        "legend_type": "legend_sf",
        "title": "Snow [cm]",
        "colors": ["rgba(0,204,255,0.2)", "rgba(0,255,255,0.25)", "rgba(48, 196, 135, 0.30)", "rgba(128, 255, 0, 0.35)",
            "rgba(225, 227, 22, 0.40)", "rgba(255,255,128, 0.45)", "rgba(255,255,0, 0.5)", "rgba(255,200,0, 0.55)",
            "rgba(255,185,67, 0.6)", "rgba(255,115,0, 0.65)", "rgba(255,0,0, 0.65)", "rgba(204,0,0, 0.7)",
            "rgba(223,83,121, 0.75)", "rgba(242,166,242,0.8)", "rgba(217,140,217,0.85)", "rgba(191,128,217,0.9)",
            "rgba(153,153,255,0.95)", "rgba(0,153,255,1)"],
        "labels": ["0.1", "0.25", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "4.0", "5.0", "7.5", "10", "15", "20",
            "25", "30", "40", "50", "60", "80"]
    },
    {
        "id": "rh",
        "legend_type": "legend_rh",
        "title": "RH [%]",
        "colors": ["rgba(255,255,255,0.0)", "rgba(204,255,255,0.2)", "rgba(153,255,255,0.4)", "rgba(102,255,255,0.6)",
            "rgba(51,255,255,0.8)", "rgba(0,255,255,1)"],
        "labels": ["60", "70", "80", "90", "100", "110"]
    },
    {
        "id": "hcc",
        "legend_type": "legend_cc",
        "title": "Cloud [%]",
        "colors": ["rgba(0,188,0,0.0)", "rgba(0,188,0,0.08)", "rgba(0,188,0,0.16)", "rgba(0,188,0,0.24)",
            "rgba(0,188,0,0.32)", "rgba(0,188,0,0.4)"],
        "labels": ["50", "60", "70", "80", "90", "100"]
    },
    {
        "id": "mcc",
        "legend_type": "legend_cc",
        "title": "Cloud [%]",
        "colors": ["rgba(0,0,255,0.0)", "rgba(0,0,255,0.08)", "rgba(0,0,255,0.16)", "rgba(0,0,255,0.24)",
            "rgba(0,0,255,0.32)", "rgba(0,0,255,0.4)"],
        "labels": ["50", "60", "70", "80", "90", "100"]
    },
    {
        "id": "lcc",
        "legend_type": "legend_cc",
        "title": "Cloud [%]",
        "colors": ["rgba(255,0,0,0.0)", "rgba(255,0,0,0.04)", "rgba(255,0,0,0.08)", "rgba(255,0,0,0.12)",
            "rgba(255,0,0,0.16)", "rgba(255,0,0,0.2)"],
        "labels": ["50", "60", "70", "80", "90", "100"]
    }
]
