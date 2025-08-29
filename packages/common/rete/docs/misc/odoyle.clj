(ns odoyle.core
    (:require
      [odoyle.rules :as o]))

(def rules
  (o/ruleset
    {
     ::character
     [:what
      [::global ::time time]
      [id ::x x]
      [id ::y y]]}))

;; create session and add rule
(def *session
  (atom (reduce o/add-rule (o/->session) rules)))

(swap! *session
       (fn [session]
           (-> session
               (o/insert ::global ::time 123)
               (o/insert ::player {::x 20 ::y 15})
               (o/insert ::enemy {::x 5 ::y 23 ::is-evil true})
               o/fire-rules)))

(println (o/query-all @*session ::character))
;; this prints
[
 ;; It captures the player and the enenmy
 ;; notice it pairs the ::time right into the record as well
 {:time 123, :id :odoyle.core/player, :x 20, :health 20, :y 15}
 {:time 123, :id :odoyle.core/enemy, :x 5, :health 13, :y 23}
 ;; But notice the ::tree record is missing, which is because it does not
 ;; have a ::health fact associated with the id.
 ;; Which means when binding on id we need to ensure all attrs match
 ;; which makes sense.
 ;;
 ;; If we did not insert the [::global ::time 123] fact then the result of the
 ;; query would be [], so all entries in the ::what block must match to return a record
 ;;
 ;; this lib also supports binding TWO id variables, but it makes the results pretty weird
 ;; so I'm not sure we need to support that just yet
 ]
