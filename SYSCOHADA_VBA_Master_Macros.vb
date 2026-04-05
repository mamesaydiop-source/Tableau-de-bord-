Sub AdvancedFeaturesMacro()
    ' This macro implements advanced features in Excel including data validation, formatting, calculations, and automation.

    ' Data Validation
    With Sheet1.Range("A1")
        .Validation.Delete ' Clear any existing validation
        .Validation.Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Operator:=xlBetween, Formula1:="Option1,Option2,Option3"
        .Value = "Option1" ' Set default value
    End With

    ' Formatting
    With Sheet1.Range("A1:B10")
        .Interior.Color = RGB(255, 255, 204) ' Light yellow background
        .Font.Bold = True
    End With

    ' Calculations
    Dim total As Double
    total = Application.WorksheetFunction.Sum(Sheet1.Range("B1:B10"))
    Sheet1.Range("C1").Value = total

    ' Automation Example
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Summary")
    ws.Range("A1").Value = "Total"
    ws.Range("B1").Value = total

    MsgBox "Advanced features macro executed successfully!"
End Sub