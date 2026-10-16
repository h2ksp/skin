export interface Base {
  code?: string;
  name: string;
  spec?: string;
  unit?: string;
  qty: number;
  baseMat: number;
  baseLab: number;
  baseExp: number;
  remark?: string;
}

export interface MaterialItem extends Base {
  type: '자재';
}

export interface LaborItem extends Base {
  type: '노무';
}

export interface CostMachine extends Base {
  type: '건설기계';
  detail: {
    detail: string;
    mat: number;
    lab: number;
    exp: number;
  }[];
}

export interface CostGroup extends Base {
  type: '일위대가';
  detail: (MaterialItem | LaborItem | CostMachine | CostGroup)[];
}

export interface ItemGroup {
  name: string;
  items: (MaterialItem | LaborItem | CostMachine | CostGroup)[];
  remark?: string;
}