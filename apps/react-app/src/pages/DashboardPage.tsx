import data from "../data/dashboard-data.json";
import {
  ChartAreaInteractive,
  DataTable,
  SectionCards,
} from "../features/dashboard";

export const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
};
