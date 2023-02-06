import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PopularTag = ({ token }) => {
  const [popularTags, setPopularTags] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/tag/get-popular-tag`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });
        setPopularTags(res.data.tags);
      } catch (e) {
        toast.error(e.response.data.error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 mt-4 bg-light rounded-3 shadow-sm">
      <p className="fs-4 text-secondary">Popular tags</p>
      <div className="p-1">
        {popularTags.map((tag, index) => {
          return (
            <div key={index} className="my-1 border-bottom">
              <Link
                href={`/tag/${tag._id}`}
                className="d-flex align-items-center"
              >
                <div className="ps-2">
                  <p className="fw-bolder text-dark">
                    {index + 1}. #{tag.tag_name}
                    <br />
                    <span className="fw-normal fst-italic">
                      {tag.number} posts
                    </span>
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularTag;
