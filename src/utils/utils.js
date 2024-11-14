export const controllerList = [
  'EFIN_A_CTR', 'EFIN_B_CTR', 'EFIN_C_CTR', 'EFIN_D_CTR', 'EFIN_E_CTR', 
  'EFIN_F_CTR', 'EFIN_G_CTR', 'EFIN_H_CTR', 'EFIN_J_CTR', 'EFIN_K_CTR',
  'EFIN_L_CTR', 'EFIN_M_CTR', 'EFIN_N_CTR', 'EFIN_V_CTR'
];

export const sectorsOwnership = {
  sector1: ['A', 'D', 'C'],
  sector2: ['B', 'C', 'D'],
  sector3: ['C', 'D'],
  sector4: ['D', 'C'],
  sector5: ['E', 'F', 'D', 'C'],
  sector6: ['F', 'D', 'C'],
  sector7: ['G', 'F', 'D', 'C'],
  sector8: ['H', 'V', 'M', 'G', 'F', 'D'],
  sector9: ['J', 'H', 'V', 'M', 'G', 'F', 'D'],
  sector10: ['K', 'M', 'G', 'F', 'D', 'C'],
  sector11: ['L', 'N', 'M', 'G', 'F', 'D', 'C'],
  sector12: ['M', 'G', 'F', 'D', 'C'],
  sector13: ['N', 'M', 'G', 'F', 'D', 'C'],
  sector14: ['V', 'M', 'G', 'F', 'D', 'C']
};

export const controllerColors = {
  'EFIN_A_CTR': '#2f4f4f',
  'EFIN_B_CTR': '#8b0000',
  'EFIN_C_CTR': '#ff8c00',
  'EFIN_D_CTR': '#00bfff',
  'EFIN_E_CTR': '#ffff00',
  'EFIN_F_CTR': '#006400',
  'EFIN_G_CTR': '#00ff00',
  'EFIN_H_CTR': '#deb887',
  'EFIN_J_CTR': '#0000cd',
  'EFIN_K_CTR': '#dda0dd',
  'EFIN_L_CTR': '#191970',
  'EFIN_M_CTR': '#ff1493',
  'EFIN_N_CTR': '#98fb98',
  'EFIN_V_CTR': '#ff4500'
};

export const controllerLabels = {
  'EFIN_A_CTR': 'EFIN A',
  'EFIN_B_CTR': 'EFIN B',
  'EFIN_C_CTR': 'EFIN C',
  'EFIN_D_CTR': 'EFIN D',
  'EFIN_E_CTR': 'EFIN E',
  'EFIN_F_CTR': 'EFIN F',
  'EFIN_G_CTR': 'EFIN G',
  'EFIN_H_CTR': 'EFIN H',
  'EFIN_J_CTR': 'EFIN J',
  'EFIN_K_CTR': 'EFIN K',
  'EFIN_L_CTR': 'EFIN L',
  'EFIN_M_CTR': 'EFIN M',
  'EFIN_N_CTR': 'EFIN N',
  'EFIN_V_CTR': 'EFIN V'
};

export const presets = {
  'D + F': ['EFIN_D_CTR', 'EFIN_F_CTR'],
  'D + G': ['EFIN_D_CTR', 'EFIN_G_CTR'],
  'D + M': ['EFIN_D_CTR', 'EFIN_M_CTR'],
  'D + V': ['EFIN_D_CTR', 'EFIN_V_CTR'],
  'D + F + V': ['EFIN_D_CTR', 'EFIN_F_CTR', 'EFIN_V_CTR'],
  'D + G + V': ['EFIN_D_CTR', 'EFIN_G_CTR', 'EFIN_V_CTR'],
  'D + M + V': ['EFIN_D_CTR', 'EFIN_M_CTR', 'EFIN_V_CTR'],
  'D + F + M': ['EFIN_D_CTR', 'EFIN_F_CTR', 'EFIN_M_CTR'],
  'D + F + M + V': ['EFIN_D_CTR', 'EFIN_F_CTR', 'EFIN_M_CTR', 'EFIN_V_CTR']
};

export const otherControllerColors = {
  'S1': '#2f4f4f',
  'MY': '#8b0000',
  'MW': '#ff8c00',
  'MK': '#00bfff',
  'M9': '#ffff00',
  'M8': '#006400',
  'M7': '#00ff00',
  'M6': '#deb887',
  'M5': '#0000cd',
  'M4': '#dda0dd',
  'M3': '#191970',
  'M2': '#ff1493',
  'SHRK': '#98fb98',
  'GRIZ': '#ff4500',
  'S2': '#c6ba6e',
  'S3': '#719752',
  'S4': '#4ec2f8',
  'S6': '#999d96',
  'S7': '#6e8e18',
  'S8': '#3d9c5c',
  'S9': '#741171',
  'SF': '#605674',
  'SK': '#6a5879',
  'SN': '#1bf0e6',
  'SKX': '#2d950d',
  'CBRA': '#ce441f',

  '19R': '#8b0000',
  '25R': '#ff8c00',
  '24R': '#00bfff',
  '26R': '#ffff00',
  '23R': '#006400',
  '18R': '#00ff00',
  'R6': '#deb887',
  'NO': '#0000cd',
  'NC': '#dda0dd',
  'NS': '#191970',
  '1R': '#ff1493',
  '2R': '#98fb98',
  '3R': '#ff4500',
  '4R': '#4761e7',
  '7R': '#2be0b6',
  '8R': '#483aa5',
  '5R': '#436ef1',
  '6R': '#8dfc55',
  'RCN': '#900c00',
  'RCS': '#abf546',
  '14R': '#ff711b',
  '15R': '#fcbd28',
  '9R': '#f96418',
  '13R': '#63fd70',
  '17R': '#aa1704',
  '21R': '#ff7f1d',
  '10R': '#ff9921',
};

export const VALID_ROUTES = [
  'KOSKA DCT OTVEG DCT GODOB DCT NEPIX',
  'EVLAN DCT OTVEG DCT GODOB DCT NEPIX', 
  'BAKLA DCT DIVEG DCT GODOB DCT NEPIX',
  'BODRI DCT DIVEG DCT GODOB DCT NEPIX',
  'TEVRU Y75 NEPIX',
  'VAGAS DCT BEGDO DCT BESLA DCT MISMO DCT NEMGU',
  'ERPUG DCT GOMAV DCT EXUTI DCT GITEV Y86 OSLIT',
  'ERPUG DCT GOMAV DCT EXUTI DCT GITEV DCT TUGPU DCT OSLIT',

  'KOSKA OTVEG GODOB NEPIX',
  'EVLAN OTVEG GODOB NEPIX', 
  'BAKLA DIVEG GODOB NEPIX',
  'BODRI DIVEG GODOB NEPIX',
  'TEVRU Y75 NEPIX',
  'VAGAS BEGDO BESLA MISMO NEMGU',
  'ERPUG GOMAV EXUTI GITEV Y86 OSLIT',
  'ERPUG GOMAV EXUTI GITEV TUGPU OSLIT',

  'TEVRU DCT OTLUD DCT SUVIB DCT NEPIX',
  'TEVRU OTLUD SUVIB NEPIX',

  'GERVU DCT SUN DCT ELBOG DCT BESLA DCT MISMO DCT NEMGU',
  'GERVU DCT SUN DCT ELBOG M607 MISMO DCT NEMGU',
  'OSLAV DCT BEGDO DCT BESLA DCT MISMO DCT NEMGU',
  'OSLAV DCT BEGDO DCT BESLA M607 MISMO DCT NEMGU',
  'SOLKA DCT OSS DCT BEGDO DCT BESLA DCT MISMO DCT NEMGU',
  'SOLKA DCT OSS DCT BEGDO DCT BESLA M607 MISMO DCT NEMGU',

  'DOBAN DCT TEVRU DCT OTLUD DCT MIMRU DCT RIBVU DCT NEPIX',
  'DOBAN TEVRU OTLUD MIMRU RIBVU NEPIX'
];
