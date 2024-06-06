import HEADER_SNIPPET from "./header";

export const AVG_SNIPPET = `${HEADER_SNIPPET}

var students = 0;
var studentsGrades = 0;

fun avg(sum, n) {
    return sum / n;
}

output("# of students: ");
students = int(input());

for (var i = 0; i < students; i = i + 1) {
    output(string(i + 1) + ") student grade: ");
    var studentGrade = number(input());
    studentsGrades  =  studentsGrades + studentGrade;
}

print string(avg(studentsGrades, students));
`;
