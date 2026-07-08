export const movies = [
  {
    id: "meg-2", title: "Meg 2: The Trench", rating: "PG-13", duration: "1h 56m", year: 2023,
    genres: ["Action", "Adventure", "Sci-Fi"], formats: ["2D", "3D"],
    poster: "https://image.tmdb.org/t/p/w500/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg",
    banner: "https://image.tmdb.org/t/p/w780/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
    description: "A research team encounters multiple threats while exploring the depths of the ocean, including a malevolent mining operation.",
    cast: ["Jason Statham", "Wu Jing", "Shuya Sophia Cai"]
  },
  {
    id: "oppenheimer", title: "Oppenheimer", rating: "R", duration: "3h 00m", year: 2023,
    genres: ["Drama", "History"], formats: ["2D", "IMAX"],
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    banner: "https://image.tmdb.org/t/p/w780/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    description: "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    cast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."]
  },
  {
    id: "barbie", title: "Barbie", rating: "PG-13", duration: "1h 54m", year: 2023,
    genres: ["Comedy", "Adventure"], formats: ["2D"],
    poster: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    banner: "https://image.tmdb.org/t/p/w780/nHf61UzkfFno5X1ofIhugCPus2R.jpg",
    description: "Barbie and Ken leave the seemingly perfect world of Barbie Land to discover the joys and perils of the real world.",
    cast: ["Margot Robbie", "Ryan Gosling", "America Ferrera"]
  },
  {
    id: "dune-2", title: "Dune: Part Two", rating: "PG-13", duration: "2h 46m", year: 2024,
    genres: ["Sci-Fi", "Adventure"], formats: ["2D", "IMAX"],
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    banner: "https://image.tmdb.org/t/p/w780/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    cast: ["Timothee Chalamet", "Zendaya", "Rebecca Ferguson"]
  }
];

export const theatres = [
  { id: "grandview", name: "The Grandview", address: "Riverside Mall, Central Avenue", price: 280, features: ["Recliner", "Dolby Atmos"] },
  { id: "cineplex", name: "Cineplex Downtown", address: "12 Market Street", price: 240, features: ["Laser", "Food Court"] },
  { id: "pvr-orion", name: "PVR Orion", address: "Orion City Centre", price: 320, features: ["IMAX", "Lounger"] }
];

export const occupiedSeats = ["A3", "A8", "B5", "C10", "D2", "D9", "E6", "F4", "G11", "H7", "H8", "H9", "H10", "J3", "K6", "L9", "M2"];

export function scheduleFor(movieId) {
  return theatres.map((theatre, i) => ({ ...theatre, movieId, screens: [
    { name: `Screen ${i + 1}`, format: i === 2 ? "IMAX" : "2D", times: ["10:00 AM", "1:30 PM", "5:15 PM", "8:45 PM"] },
    { name: `Screen ${i + 3}`, format: "3D", times: ["11:20 AM", "3:00 PM", "7:10 PM"] }
  ] }));
}
