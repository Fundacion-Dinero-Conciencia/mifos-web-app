export interface NotificationBody {
  type: string;
  cutoffDate: string;
  dateFormat: string;
  locale: string;
  clientIds?: number[];
}
