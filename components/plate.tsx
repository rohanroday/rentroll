import Link from "next/link";
import type { Plate as PlateData } from "@/lib/data";
import { balanceOf, rupees, statusText } from "@/lib/rent";
import { Icon } from "./icons";

type Props = { plate: PlateData; today: string; canEdit: boolean; showProperty: boolean; justPaid?: boolean };

export function RoomPlate({ plate, today, canEdit, showProperty, justPaid }: Props) {
  const building = showProperty ? <span className="plate-property">{plate.property}</span> : null;

  if (plate.kind === "vacant") {
    const inner = (
      <>
        <span className="plate-no">{plate.label}</span>
        {building}
        <span className="plate-name">Vacant</span>
        {canEdit && <span className="plate-status">Add tenant</span>}
      </>
    );
    return canEdit ? (
      <Link className="plate plate-vacant" href={`/rooms/new?property=${encodeURIComponent(plate.property)}&room=${encodeURIComponent(plate.label)}`}>{inner}</Link>
    ) : (
      <div className="plate plate-vacant">{inner}</div>
    );
  }

  const { tenant, status } = plate;
  const amount = status === "paid" ? tenant.rent : balanceOf(tenant);
  const left = tenant.paid_so_far > 0 ? " left" : "";
  return (
    <Link className={`plate plate-${status}`} data-just-paid={justPaid ? "" : undefined} href={`/tenants/${tenant.id}`}>
      <span className="plate-no">{plate.label}</span>
      {building}
      <span className="plate-name">{tenant.name}</span>
      <span className="plate-amount">{rupees(amount)}{left}</span>
      <span className="plate-status">
        {status === "overdue" && <Icon name="alert" size={16} />}
        {status === "paid" && <Icon name="check" size={16} />}
        {statusText(status, tenant.next_due, today)}
      </span>
    </Link>
  );
}
