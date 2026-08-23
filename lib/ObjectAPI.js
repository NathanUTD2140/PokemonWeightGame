import { apiUrl } from './apiBaseUrl.js';

export async function fetchObject(){
    const res = await fetch(apiUrl('/objects/random'), {
        credentials: 'include',
    });

    if (!res.ok){
        throw new Error(`Failed to fetch random object: ${res.status}`);
    }
    
    const data = await res.json();
    return{
        id: data._id,
        name: data.object_name,
        weight: data.weight,
        image: data.photo_url,
    };
}