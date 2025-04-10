import React, { useState } from 'react';
import { IUser } from '../interfaces/IUser';
import { AssignedUsersContext } from './Sidebar/Sidebar';

export const AssignedUsersProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [assignedUsers, setAssignedUsers] = useState<IUser[]>([]);

  return (
    <AssignedUsersContext.Provider value={{ assignedUsers, setAssignedUsers }}>
      {children}
    </AssignedUsersContext.Provider>
  );
};