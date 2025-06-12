import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export interface StudentAttributes {
  id: string;
  Toan?: number;
  NguVan?: number;
  NgoaiNgu?: number;
  MaNgoaiNgu?: number;
  VatLi?: number;
  HoaHoc?: number;
  SinhHoc?: number;
  LichSu?: number;
  DiaLi?: number;
  GDCD?: number;
}

export class Student extends Model<StudentAttributes> implements StudentAttributes {
  public id!: string;
  public Toan?: number;
  public NguVan?: number;
  public NgoaiNgu?: number;
  public MaNgoaiNgu?: number;
  public VatLi?: number;
  public HoaHoc?: number;
  public SinhHoc?: number;
  public LichSu?: number;
  public DiaLi?: number;
  public GDCD?: number;

}

Student.init({
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  Toan: DataTypes.FLOAT,
  NguVan: DataTypes.FLOAT,
  NgoaiNgu: DataTypes.FLOAT,
  MaNgoaiNgu: DataTypes.INTEGER,
  VatLi: DataTypes.FLOAT,
  HoaHoc: DataTypes.FLOAT,
  SinhHoc: DataTypes.FLOAT,
  LichSu: DataTypes.FLOAT,
  DiaLi: DataTypes.FLOAT,
  GDCD: DataTypes.FLOAT
}, {
  sequelize,
  tableName: 'Student',
  timestamps: false
});

export default Student;
