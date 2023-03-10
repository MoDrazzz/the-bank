import { useAuthContext } from "contexts/AuthContext";
import { FC, useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Accent from "./Accent";
import FormField from "./FormField";
import Heading from "./Heading";
import Input from "./Input";
import Label from "./Label";
import List from "./List";
import UserOperation from "./UserOperation";
import Paragraph from "./Paragraph";
import useBank from "hooks/useBank";
import Button from "./Button";
import FilterOptionInput from "./FilterOptionInput";
import ListItem from "./ListItem";
import AdminOperation from "./AdminOperation";

const AdminOperationsHistory: FC = () => {
  const { user, activeAccount } = useAuthContext();
  const { getSpecifiedData, error } = useBank();
  const [userOperations, setUserOperations] = useState<Operation[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);
  const [filterOption, setFilterOption] = useState<
    "id" | "sender" | "receiver"
  >("id");

  const getOperations = useCallback(async () => {
    if (!user) return;
    const res = await getSpecifiedData("operations");

    if (res) {
      setFilteredOperations(res);
      setUserOperations(res);
      setIsFetching(false);
    }
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);

    const newOperations = userOperations.filter((operation) =>
      operation[filterOption]
        .toString()
        .startsWith(e.target.value.toLowerCase())
    );

    setFilteredOperations(newOperations);
  };

  const handleFilterOptionChange = (
    option: "id" | "sender" | "receiver"
  ): void => {
    setFilterOption(option);
    setSearchValue("");
    setFilteredOperations(userOperations);
  };

  useEffect(() => {
    setFilteredOperations(userOperations);
  }, [userOperations, filterOption]);

  useEffect(() => {
    getOperations();
  }, [activeAccount, user]);

  const handleRefresh = async () => {
    setIsFetching(true);
    await getOperations();
    setIsFetching(false);
  };

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <aside className="flex flex-col items-center gap-5 overflow-y-hidden px-[5%] pt-12">
      <Heading>Operations History</Heading>
      <Accent />
      <div className="grid w-full gap-2">
        <div className="flex w-full justify-between">
          <Label htmlFor="searchOperations">Filter by:</Label>
          <div className="flex gap-5">
            <FilterOptionInput
              onChange={() => handleFilterOptionChange("id")}
              checked={filterOption === "id"}
              value="id"
            />
            <FilterOptionInput
              onChange={() => handleFilterOptionChange("sender")}
              checked={filterOption === "sender"}
              value="sender"
            />
            <FilterOptionInput
              onChange={() => handleFilterOptionChange("receiver")}
              checked={filterOption === "receiver"}
              value="receiver"
            />
          </div>
        </div>
        <Input
          type="text"
          name="searchOperations"
          value={searchValue}
          onChange={handleSearch}
        />
        <Button onClick={handleRefresh}>Refresh</Button>
      </div>
      <List>
        <li className="grid grid-cols-[1fr_120px_75px_75px] gap-3">
          <ListItem>ID</ListItem>
          <ListItem>AMOUNT</ListItem>
          <ListItem>SENDER</ListItem>
          <ListItem>RECEIVER</ListItem>
        </li>
        {isFetching ? (
          <Paragraph>Loading...</Paragraph>
        ) : !filteredOperations.length ? (
          <Paragraph>No operations found.</Paragraph>
        ) : (
          filteredOperations
            .sort((a, b) => b.date - a.date)
            .map((operationData) => (
              <AdminOperation
                key={operationData.id}
                data={operationData}
                refreshOperations={handleRefresh}
              />
            ))
        )}
      </List>
    </aside>
  );
};
export default AdminOperationsHistory;
