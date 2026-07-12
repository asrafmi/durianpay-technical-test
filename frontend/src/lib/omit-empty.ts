export default function omitEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>
}
