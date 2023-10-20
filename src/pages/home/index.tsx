import React, { useState } from 'react';
import DisplayReviews from '~/components/home/homeComponents/reviws/displayReviews';
import About from '~/components/home/homeComponents/about'
import NewReview from '~/components/home/homeComponents/reviws/newReview';

const HomePage: React.FC = () => {
  const [showNewReview, setShowNewReview] = useState(false);

  const handleToggleNewReview = () => {
    setShowNewReview(!showNewReview); // Toggle the state
  };

  return (
    <div className='w-full relative flex items-center flex-col'>
      <About/>
      <DisplayReviews/>
      {showNewReview ? (
        <NewReview onClose={handleToggleNewReview} />
      ) : (
        <button onClick={handleToggleNewReview} className="mt-10 bg-black text-center p-2 text-white font-bold">
          Add Review
        </button>
      )}
    </div>
  );
};

export default HomePage;
