//burada entity olacagi icin hic bir katman ile baglantisi olmamali cunku burasi domain layer.

//yani buraya bir contract verecegim
export interface User {
  id?: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
