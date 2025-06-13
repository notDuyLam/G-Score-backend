import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

export interface StudentAttributes {
  sbd: string;
  toan?: number;
  ngu_van?: number;
  ngoai_ngu?: number;
  vat_li?: number;
  hoa_hoc?: number;
  sinh_hoc?: number;
  lich_su?: number;
  dia_li?: number;
  gdcd?: number;
  ma_ngoai_ngu?: string;
}

export class Student
  extends Model<StudentAttributes>
  implements StudentAttributes
{
  public sbd!: string;
  public toan?: number;
  public ngu_van?: number;
  public ngoai_ngu?: number;
  public vat_li?: number;
  public hoa_hoc?: number;
  public sinh_hoc?: number;
  public lich_su?: number;
  public dia_li?: number;
  public gdcd?: number;
  public ma_ngoai_ngu?: string;
}

Student.init(
  {
    sbd: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    toan: DataTypes.FLOAT,
    ngu_van: DataTypes.FLOAT,
    ngoai_ngu: DataTypes.FLOAT,

    vat_li: DataTypes.FLOAT,
    hoa_hoc: DataTypes.FLOAT,
    sinh_hoc: DataTypes.FLOAT,
    lich_su: DataTypes.FLOAT,
    dia_li: DataTypes.FLOAT,
    gdcd: DataTypes.FLOAT,
    ma_ngoai_ngu: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "Student",
    timestamps: false,
  }
);

export default Student;
