export interface LegendConfig {
  id: string;
  title: string;
  legend_type: string;
  colors: string[];
  labels: string[];
}

export const LEGEND_DATA: LegendConfig[] = [
  {
    id: "tm2",
    legend_type: "legend_t2m",
    title: "T [°C]",
    colors: [
      "#ff9900","#ffcc00","#7200ff","#bf00ff","#ff00ff","#cc00cc",
      "#990099","#660066","#660000","#990000","#cc0000","#ff0000",
      "#ff6600",
      "#ff9900",
      "#ffcc00",
      "#ffff00",
      "#cce500",
      "#7fcc00",
      "#00b200",
      "#00cc7f",
      "#00e5cc",
      "#00ffff",
      "#00bfff",
      "#008cff",
      "#0059ff",
      "#0000ff",
      "#7200ff",
      "#bf00ff",
      "#ff00ff",
      "#cc00cc",
      "#990099",
      "#660066",
      "#660000",
      "#990000",
      "#cc0000",
      "#ff0000",
      "#ff6600",
      "#ff9900",
      "#ffcc00",
    ],
    labels: [
      "46"," ","42"," ","38"," ","34"," ","30"," ",
      "26"," ","22","","18"," ","14"," ","10"," ",
      "6"," ","2"," ","-2"," ","-6"," ","-10"," ",
      "-14"," ","-18","","-22"," ","-26"," ","-30",
    ],
  },
  {
    id: "prec3tp",
    legend_type: "legend_prec",
    title: "Prp 3h [mm]",
    colors: [
      "rgba(0,153,255,1)",
"rgba(153,153,255,0.95)",
"rgba(191,128,217,0.9)",
"rgba(217,140,217,0.85)",
"rgba(242,166,242,0.8)",
"rgba(223,83,121, 0.75)",
"rgba(204,0,0, 0.7)",
"rgba(255,0,0, 0.65)",
"rgba(255,115,0, 0.65)",
"rgba(255,185,67, 0.6)",
"rgba(255,200,0, 0.55)",
"rgba(255,255,0, 0.5)",
"rgba(255,255,128, 0.45)",
"rgba(225, 227, 22, 0.40)",
"rgba(128, 255, 0, 0.35)",
"rgba(48, 196, 135, 0.30)",
"rgba(0,255,255,0.25)",
"rgba(0,204,255,0.2)",
    ],
    labels: [
      "300",
"200",
"100",
"75",
"50",
"40",
"30",
"25",
"20",
"15",
"10",
"8",
"6",
"5",
"4",
"3",
"2",
"1",
    ],
  },
  {
    id: "prec6tp",
    legend_type: "legend_prec",
    title: "Prp 6h [mm]",
    colors: [
      "rgba(0,153,255,1)",
"rgba(153,153,255,0.95)",
"rgba(191,128,217,0.9)",
"rgba(217,140,217,0.85)",
"rgba(242,166,242,0.8)",
"rgba(223,83,121, 0.75)",
"rgba(204,0,0, 0.7)",
"rgba(255,0,0, 0.65)",
"rgba(255,115,0, 0.65)",
"rgba(255,185,67, 0.6)",
"rgba(255,200,0, 0.55)",
"rgba(255,255,0, 0.5)",
"rgba(255,255,128, 0.45)",
"rgba(225, 227, 22, 0.40)",
"rgba(128, 255, 0, 0.35)",
"rgba(48, 196, 135, 0.30)",
"rgba(0,255,255,0.25)",
"rgba(0,204,255,0.2)",
    ],
    labels: [
      "300",
"200",
"100",
"75",
"50",
"40",
"30",
"25",
"20",
"15",
"10",
"8",
"6",
"5",
"4",
"3",
"2",
"1",
    ],
  },
  {
    id: "sf3",
    legend_type: "legend_sf",
    title: "Snow [cm]",
    colors: [
      "rgba(0,255,255,0.25)",
      "rgba(0,204,255,0.2)",
      "rgba(0,153,255,1)",
      "rgba(153,153,255,0.95)",
      "rgba(191,128,217,0.9)",
      "rgba(217,140,217,0.85)",
      "rgba(242,166,242,0.8)",
      "rgba(223,83,121, 0.75)",
      "rgba(204,0,0, 0.7)",
      "rgba(255,0,0, 0.65)",
      "rgba(255,115,0, 0.65)",
      "rgba(255,185,67, 0.6)",
      "rgba(255,200,0, 0.55)",
      "rgba(255,255,0, 0.5)",
      "rgba(255,255,128, 0.45)",
      "rgba(225, 227, 22, 0.40)",
      "rgba(128, 255, 0, 0.35)",
      "rgba(48, 196, 135, 0.30)",
      "rgba(0,255,255,0.25)",
      "rgba(0,204,255,0.2)",
    ],
    labels: [
      "80","60","50","40","30","25","20","15","10","7.5","5","4","3","2.5","2","1.5","1","0.5","0.25","0.1",],
  },
  {
    id: "rh",
    legend_type: "legend_rh",
    title: "RH [%]",
    colors: [
      "rgba(0,255,255,1)","rgba(51,255,255,0.8)","rgba(102,255,255,0.6)","rgba(153,255,255,0.4)","rgba(204,255,255,0.2)","rgba(255,255,255,0.0)",],
    labels: [
      "110","100","90","80","70","60",],
  },
  {
    id: "hcc",
    legend_type: "legend_cc",
    title: "High Cloud [%]",
    colors: [
      "rgba(0,188,0,0.4)","rgba(0,188,0,0.32)","rgba(0,188,0,0.24)","rgba(0,188,0,0.16)","rgba(0,188,0,0.08)","rgba(0,188,0,0.0)",],
    labels: ["100","90","80","70","60","50",],
  },
  {
    id: "mcc",
    legend_type: "legend_cc",
    title: "Medium Cloud [%]",
    colors: [
      "rgba(0,0,255,0.4)",
      "rgba(0,0,255,0.32)",
      "rgba(0,0,255,0.24)",
      "rgba(0,0,255,0.16)",
      "rgba(0,0,255,0.08)",
      "rgba(0,0,255,0.0)",
    ],
    labels: ["100","90","80","70","60","50",],
  },
  {
    id: "lcc",
    legend_type: "legend_cc",
    title: "Low Cloud [%]",
    colors: [
      "rgba(255,0,0,0.2)",
      "rgba(255,0,0,0.16)",
      "rgba(255,0,0,0.12)",
      "rgba(255,0,0,0.08)",
      "rgba(255,0,0,0.04)",
      "rgba(255,0,0,0.0)",
    ],
    labels: ["100","90","80","70","60","50",],
    },
    {
        id: "tpprob",
        legend_type: "legend_tpprob",
        title: "PRP PROB [%]",
        colors: [
          "rgb(255,0,0)",
          "rgb(255,117,20)",
          "rgb(255,255,0)",
          "rgb(204,255,0)",
          "rgb(102,255,0)",
          "rgb(0,255,0)",
          "rgb(127,255,212)",
          "rgb(0,255,255)",
          "rgb(0,127,255)",
          "rgb(0,0,255)",
        ],
        labels: [
          "105","90","80",
          "70","60","50",
          "40","30","20",
          "10","2",],
      },
  {
    id: "tpperc",
    legend_type: "legend_tpperc",
    title: "PRP PERC [mm]",
    colors: [
      // "#737373",
      "rgb(115,115,115)",
      "rgb(11,11,110)",
      "rgb(10,10,214)",
      "rgb(94,74,232)",
      "rgb(161,2,235)",
      "rgb(217,1,255)",
      "red",
      "rgb(255,125,1)",
      "rgb(255,186,1)",
      "rgb(227,227,17)",
      "rgb(230,255,102)",
      "rgb(153,232,15)",
      "rgb(135,204,33)",
      "rgb(18,217,156)",
      "rgb(115,237,199)",
      "rgb(191,242,237)",
    ],
    labels: [
      "10000","500","300","200","150",
      "125","100","80","60","50",
      "40","30","20","10","5",
      "2","0.5",
    ],
  },

];
