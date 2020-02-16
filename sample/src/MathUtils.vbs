''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' Clamps number within the inclusive lower and upper bounds.
'     Number : The number to clamp.
'     Lower  : The lower bound.
'     Upper  : The upper bound.
' Returns the first element of array.
'
Public Function Clamp(Number, Lower, Upper)
    If Number < Lower Then
        Clamp = Lower
    ElseIf Number > Upper Then
        Clamp = Upper
    Else
        Clamp = Number
    End If
End Function
