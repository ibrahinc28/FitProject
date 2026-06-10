export interface GymModel {
  modelId: string
  name: string
  description: string
  price: number
  areaM2: number
  capacity: number
  imageUrl: string
  available: boolean
}

export interface SaleDTO {
  saleId: string
  unitId: string
  modelName: string
  buyerName: string
  buyerEmail: string
  salePrice: number
  status: string
  createdAt: string
}

export interface SaleRequest {
  unitId: string
  buyerName: string
  buyerEmail: string
  buyerId?: string
}