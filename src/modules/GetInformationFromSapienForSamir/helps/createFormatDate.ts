export function convertToDate(dateString){
        const [day, month, year] = dateString.split('/');
        return new Date(`${year}-${month}-${day}`);
}