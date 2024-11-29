import React, { useState } from "react";
import OpenMicFinder from "./Comedy";
import EmailCollectionDialog from "./EmailCollectionDialog";

const App = () => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div>
      <OpenMicFinder />
      <button
        onClick={() => setShowDialog(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg"
      >
        Join Beta
      </button>
      {showDialog && <EmailCollectionDialog onClose={() => setShowDialog(false)} />}
    </div>
  );
};

export default App;
