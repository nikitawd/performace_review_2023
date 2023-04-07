export interface UsersScreenProps {
  name: string;
  age: number;
}

const UsersScreen = ({ name, age }: UsersScreenProps) => {
  return (
    <div>
      <h1>Users Screen </h1>
      <p> {name} </p>
      <p> {age} </p>
    </div>
  );
};

export default UsersScreen;
