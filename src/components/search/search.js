import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './search.css'
import {CiLocationOn } from "react-icons/ci";
import {useToast} from '../contexts/ToastService'
import { ReactComponent as NoProductFound } from '../../assets/SVG/no-post.svg';
function Search() {
    const location = useLocation();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const query = new URLSearchParams(location.search).get('q');
    const [isLoading, setIsLoading]=useState(true);
    const {notifyError}=useToast();

    const openItem = (product) => {
        if (product) {
            const pDetails = `${product.category}-${product.title}`
                .replace(/[\s,]+/g, '-');
            const url = `${pDetails}-pid-${product.productId}`;
            navigate(`/item/${url}`);
        }

    }

    useEffect(() => {
        if (query) {
            fetch(`http://localhost:5000/users/post/search?query=${query}`)
                .then((res) => res.json())
                .then((data) => {
                    setResults(data)
                    setIsLoading(false);
                })
            .catch((error) => {
                setIsLoading(true);
                console.error(error);
                notifyError(error);
            });
        }
    }, [query]);

    return (
        <div className='search-result-container'>
            <span className='search-query'>Search Results for "{query}"</span>
            {isLoading ? (
               
                    <div className='search-result-container'>
                        {Array(5).fill(0).map((_, index) => (
                            <div key={index} className='search-result-item skeleton-item'>
                                <div className='profile-post-img-wrapper skeleton-animation'></div>
                                <div className='profile-post-info-wrapper skeleton-info-wrapper'>
                                    <span className='profile-post-price skeleton-price skeleton-animation'></span>
                                    <span className='profile-post-title skeleton-product-title skeleton-animation'></span>
                                    <span className='profile-post-location skeleton-product-address skeleton-animation'></span>
                                </div>
                            </div>
                        ))}
                    </div>
            ) : results.length === 0 ? (
                <div className='profile-post-not-found-error'>
                    <NoProductFound width={150} height={150} style={{ alignSelf: 'center' }} />
                    <span className="no-post-error-text" style={{ marginTop: '-25px' }}>Sorry, no posts were found.</span>
                </div>
            ) : (<>
                {
                    results.map((result) => (
                        <div key={result._id} className='search-result-item' onClick={() => openItem(result)}>
                            <div className='search-result-poster'>
                                <img src={result.images[1]} className='search-result-img' />
                            </div>
                            <div className='search-result-details'>
                                <div className='h-price-and-date'>
                                    <span className='h-product-price'>{result.price}</span>
                                    <span className='h-product-date'>{result.date}</span>
                                </div>
                                <span className='h-product-title'>{result.title}</span>
                                <span className='related-item-location'>{result.description}</span>
                                <div className='h-product-location-wrapper'>
                                    <CiLocationOn className='h-product-location-icon' />
                                    <span className='h-product-location'>{result.address}</span>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </>
            )
            }
        </div >
    )
}
export default Search;