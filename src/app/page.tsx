// import { getPosts } from '../../actions/postAction'
import {getCollection } from '../lib/db'

export default async function Home() {
  const res = await getCollection("users");

  console.log(res)
  return (
<div>Hello Nur</div>
  );
}
