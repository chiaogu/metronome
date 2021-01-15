import { h } from 'preact';

const gifs = [
  'https://media.giphy.com/media/6mr2y6RGPcEU0/giphy.gif',
  'https://media.giphy.com/media/PPy2wTXW9BJok/giphy.gif',
  'https://media.giphy.com/media/xT77XLWNWgg42wbKVi/giphy.gif',
  'https://media.giphy.com/media/xT8qAY7e9If38xkrIY/giphy.gif',
  'https://media.giphy.com/media/CIa20W7zhQIuY/giphy.gif',
  'https://media.giphy.com/media/5zosFvohZrssDQyl0m/giphy.gif',
  'https://media.giphy.com/media/CEC45sbOpCoEg/giphy.gif',
  'https://media.giphy.com/media/1GrsfWBDiTN60/giphy.gif',
]

export default function Gallery({ onSelect }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap'
      }}
    >
      {gifs.map(url => (
        <img
          src={url}
          onClick={() => onSelect(url)}
        />
      ))}
    </div>
  )
}