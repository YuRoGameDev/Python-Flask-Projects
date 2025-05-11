import json

def data(queryName, search, bedrooms, sort):
    f = open('/apartments.json')
    apts = json.load(f)
    f.close()

    if(search is None):
        search = ''
    if(bedrooms is None):
        bedrooms = "0"

    result_list = []
    print("This is a log message")
    if(queryName is not None):
        search = search.lower()
        beds = int(bedrooms)
        for apt in apts:
            if search in apt['title'].lower() or search in apt['description'].lower():
                if apt['bedrooms'] >= beds:
                    result_list.append(apt)

        if(sort == "asc"):
            result_list.sort(key = lambda apt: apt['rent'])
        elif(sort == "dec"):
            result_list.sort(key = lambda apt: apt['rent'], reverse=True)

    return { 'result':result_list }



